<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\View\View;

class MapController extends Controller
{
    public function __invoke(): View
    {
        $units = Unit::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get([
                'id',
                'name',
                'unit_type',
                'status',
                'latitude',
                'longitude',
                'site_name',
                'category',
            ]);

        return view('map', compact('units'));
    }
}
