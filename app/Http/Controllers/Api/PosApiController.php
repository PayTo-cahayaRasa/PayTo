<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Pos\HistoryQueryController;
use App\Http\Controllers\Pos\ProductQueryController;
use App\Http\Controllers\Pos\ProfileQueryController;
use Illuminate\Http\Request;

class PosApiController extends Controller
{
    public function products(Request $request)
    {
        $controller = new ProductQueryController;

        return response()->json(['data' => $controller->fetch()]);
    }

    public function history(Request $request)
    {
        $controller = new HistoryQueryController;
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $userId = $request->user()->id;

        $result = $controller->fetchPaginated($page, $perPage, [
            'userId' => $userId,
            'startDate' => $startDate ? (string) $startDate : null,
            'endDate' => $endDate ? (string) $endDate : null,
        ]);

        return response()->json($result);
    }

    public function profile(Request $request)
    {
        $userId = $request->query('user_id');
        $controller = new ProfileQueryController;

        return response()->json(['data' => $controller->fetch($userId ? (int) $userId : null)]);
    }
}
