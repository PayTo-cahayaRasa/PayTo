<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Pos\HistoryQueryController;
use App\Http\Controllers\Pos\ProductQueryController;
use App\Http\Controllers\Pos\ProfileQueryController;
use Illuminate\Http\Request;

class PosApiController extends Controller
{
    public function __construct(
        private readonly ProductQueryController $productQuery,
        private readonly HistoryQueryController $historyQuery,
        private readonly ProfileQueryController $profileQuery
    ) {}

    public function products(Request $request)
    {
        return response()->json(['data' => $this->productQuery->fetch()]);
    }

    public function history(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $userId = $request->user()->id;

        $result = $this->historyQuery->fetchPaginated($page, $perPage, [
            'userId' => $userId,
            'startDate' => $startDate ? (string) $startDate : null,
            'endDate' => $endDate ? (string) $endDate : null,
        ]);

        return response()->json($result);
    }

    public function profile(Request $request)
    {
        // Always use authenticated user, ignore any user_id query parameter
        return response()->json(['data' => $this->profileQuery->fetch(null)]);
    }
}
