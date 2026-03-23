<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Job;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(private ApplicationService $applicationService) {}

    /**
     * @OA\Post(
     *     path="/jobs/{id}/apply",
     *     tags={"Application"},
     *     summary="求人に応募",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="求人ID", @OA\Schema(type="string")),
     *     @OA\Response(response=201, description="応募成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Application"))),
     *     @OA\Response(response=403, description="権限なし（求職者のみ応募可）", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=422, description="二重応募", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $this->authorize('create', Application::class);

        $job = Job::published()->findOrFail($id);
        $application = $this->applicationService->apply($job, $request->user());

        return response()->json(['data' => new ApplicationResource($application->load(['job.company']))], 201);
    }

    /**
     * @OA\Get(
     *     path="/applications/me",
     *     tags={"Application"},
     *     summary="自分の応募履歴",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Application")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="求職者のみアクセス可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function indexMe(Request $request): JsonResponse
    {
        if (!$request->user()->isJobseeker()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $applications = Application::where('jobseeker_id', $request->user()->id)
            ->with(['job.company', 'thread'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => ApplicationResource::collection($applications->items()),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
                'last_page' => $applications->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/jobs/{id}/applications",
     *     tags={"Application"},
     *     summary="求人への応募者一覧（企業用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="求人ID", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Application")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="自社求人のみ参照可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function indexByJob(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        $this->authorize('update', $job);

        $applications = $job->applications()
            ->with(['jobseeker'])
            ->paginate(20);

        return response()->json([
            'data' => ApplicationResource::collection($applications->items()),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
                'last_page' => $applications->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/applications/{id}",
     *     tags={"Application"},
     *     summary="応募詳細",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Application"))),
     *     @OA\Response(response=403, description="権限なし", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $application = Application::with(['job.company', 'jobseeker'])->findOrFail($id);
        $user = $request->user();

        if ($user->isJobseeker() && $application->jobseeker_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->isCompany() && $user->companyProfile?->id !== $application->job?->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => new ApplicationResource($application)]);
    }

    /**
     * @OA\Put(
     *     path="/applications/{id}/status",
     *     tags={"Application"},
     *     summary="応募ステータス変更（企業用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"applied","screening","interview","offered","rejected"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="更新成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Application"))),
     *     @OA\Response(response=403, description="自社求人の応募のみ変更可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:applied,screening,interview,offered,rejected'],
        ]);

        $application = Application::with('job')->findOrFail($id);
        $this->authorize('updateStatus', $application);

        $application = $this->applicationService->updateStatus($application, $request->status);

        return response()->json(['data' => new ApplicationResource($application->load(['job.company']))]);
    }
}
