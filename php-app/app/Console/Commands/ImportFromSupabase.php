<?php

namespace App\Console\Commands;

use App\Models\StatusHistory;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

#[Signature('app:import-from-supabase {--truncate : Limpia tablas antes de importar}')]
#[Description('Importa unidades, tickets y bitácoras desde Supabase a MySQL.')]
class ImportFromSupabase extends Command
{
    public function handle(): int
    {
        $url = env('SUPABASE_URL');
        $key = env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$url || !$key) {
            $this->error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env');
            return self::FAILURE;
        }

        if ($this->option('truncate')) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            TicketStatusHistory::truncate();
            StatusHistory::truncate();
            Ticket::truncate();
            Unit::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $headers = [
            'apikey' => $key,
            'Authorization' => "Bearer {$key}",
        ];

        $this->info('Importando unidades...');
        $units = $this->fetchAll($url, 'units', $headers);
        Unit::upsert($units, ['id']);

        $this->info('Importando tickets...');
        $tickets = $this->fetchAll($url, 'tickets', $headers);
        Ticket::upsert($tickets, ['id']);

        $this->info('Importando status_history...');
        $statusHistory = $this->fetchAll($url, 'status_history', $headers);
        StatusHistory::upsert($statusHistory, ['id']);

        $this->info('Importando ticket_status_history...');
        $ticketHistory = $this->fetchAll($url, 'ticket_status_history', $headers);
        TicketStatusHistory::upsert($ticketHistory, ['id']);

        $this->info('Importación completada.');
        $this->line('Units: '.count($units));
        $this->line('Tickets: '.count($tickets));
        $this->line('Status history: '.count($statusHistory));
        $this->line('Ticket status history: '.count($ticketHistory));

        return self::SUCCESS;
    }

    private function fetchAll(string $baseUrl, string $table, array $headers): array
    {
        $all = [];
        $pageSize = 1000;

        for ($page = 0; $page < 100; $page++) {
            $from = $page * $pageSize;
            $to = $from + $pageSize - 1;

            $response = Http::withHeaders($headers)
                ->withHeader('Range', "{$from}-{$to}")
                ->get(rtrim($baseUrl, '/')."/rest/v1/{$table}", [
                    'select' => '*',
                    'order' => 'created_at.asc',
                ]);

            if (!$response->ok()) {
                throw new \RuntimeException("Error importando {$table}: ".$response->body());
            }

            $rows = $response->json();
            if (!is_array($rows) || count($rows) === 0) {
                break;
            }

            $all = array_merge($all, $rows);
            if (count($rows) < $pageSize) {
                break;
            }
        }

        return $all;
    }
}
