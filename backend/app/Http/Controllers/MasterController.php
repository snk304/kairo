<?php

namespace App\Http\Controllers;

use App\Models\DisabilityType;
use App\Models\JobCategory;
use App\Models\Prefecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class MasterController extends Controller
{
    /**
     * @OA\Get(
     *     path="/master/disability-types",
     *     tags={"Master"},
     *     summary="障害種別一覧",
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/MasterItem"))
     *         )
     *     )
     * )
     */
    public function disabilityTypes(): JsonResponse
    {
        $data = Cache::remember('disability_types', 3600, fn() =>
            DisabilityType::orderBy('name')->get(['id', 'name'])->toArray()
        );

        return response()->json(['data' => $data]);
    }

    /**
     * @OA\Get(
     *     path="/master/job-categories",
     *     tags={"Master"},
     *     summary="職種一覧",
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/MasterItem"))
     *         )
     *     )
     * )
     */
    public function jobCategories(): JsonResponse
    {
        $data = Cache::remember('job_categories', 3600, fn() =>
            JobCategory::orderBy('name')->get(['id', 'name'])->toArray()
        );

        return response()->json(['data' => $data]);
    }

    /**
     * @OA\Get(
     *     path="/master/prefectures",
     *     tags={"Master"},
     *     summary="都道府県一覧",
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/MasterItem"))
     *         )
     *     )
     * )
     */
    public function prefectures(): JsonResponse
    {
        $data = Cache::remember('prefectures', 3600, fn() =>
            Prefecture::orderBy('name')->get(['id', 'name'])->toArray()
        );

        return response()->json(['data' => $data]);
    }
}
