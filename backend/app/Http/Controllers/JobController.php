<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobRequest;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Services\JobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function __construct(private JobService $jobService) {}
    /**
     * @OA\Get(
     *     path="/jobs",
     *     tags={"Job"},
     *     summary="求人一覧（公開）",
     *     @OA\Parameter(name="job_category_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="prefecture_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="employment_type", in="query", @OA\Schema(type="string", enum={"full_time","part_time","contract","dispatch"})),
     *     @OA\Parameter(name="work_style", in="query", @OA\Schema(type="string", enum={"office","remote","hybrid"})),
     *     @OA\Parameter(name="keyword", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", default=20)),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Job")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Job::published()
            ->with(['company', 'jobCategory', 'prefecture']);

        if ($request->job_category_id) {
            $query->where('job_category_id', $request->job_category_id);
        }
        if ($request->prefecture_id) {
            $query->where('prefecture_id', $request->prefecture_id);
        }
        if ($request->employment_type) {
            $query->where('employment_type', $request->employment_type);
        }
        if ($request->work_style) {
            $query->where('work_style', $request->work_style);
        }
        if ($request->keyword) {
            $ids = Job::search($request->keyword)->keys();
            $query->whereIn('id', $ids);
        }

        $perPage = (int) ($request->per_page ?? 20);
        $paginated = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => JobResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/jobs/{id}",
     *     tags={"Job"},
     *     summary="求人詳細（公開）",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Job"))
     *     ),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $job = Job::published()
            ->with(['company', 'jobCategory', 'prefecture'])
            ->findOrFail($id);

        return response()->json(['data' => new JobResource($job)]);
    }

    /**
     * @OA\Get(
     *     path="/jobs/me",
     *     tags={"Job"},
     *     summary="自社求人一覧",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string", enum={"draft","published","closed"})),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Job")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function indexMe(Request $request): JsonResponse
    {
        $profile = $request->user()->companyProfile;

        $query = Job::where('company_id', $profile->id)
            ->withCount('applications')
            ->with(['jobCategory', 'prefecture']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $paginated = $query->latest()->paginate(20);

        return response()->json([
            'data' => JobResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/jobs",
     *     tags={"Job"},
     *     summary="求人作成",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="job_category_id", type="string", nullable=true),
     *             @OA\Property(property="description", type="string", nullable=true),
     *             @OA\Property(property="employment_type", type="string", enum={"full_time","part_time","contract","dispatch"}, nullable=true),
     *             @OA\Property(property="work_style", type="string", enum={"office","remote","hybrid"}, nullable=true),
     *             @OA\Property(property="salary_min", type="integer", nullable=true),
     *             @OA\Property(property="salary_max", type="integer", nullable=true),
     *             @OA\Property(property="prefecture_id", type="string", nullable=true),
     *             @OA\Property(property="considerations", ref="#/components/schemas/Considerations", nullable=true),
     *             @OA\Property(property="status", type="string", enum={"draft","published","closed"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="作成成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Job"))),
     *     @OA\Response(response=403, description="権限なし", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function store(JobRequest $request): JsonResponse
    {
        $this->authorize('create', Job::class);

        $job = $this->jobService->create($request->user(), $request->validated());

        return response()->json(['data' => new JobResource($job)], 201);
    }

    /**
     * @OA\Put(
     *     path="/jobs/{id}",
     *     tags={"Job"},
     *     summary="求人更新",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/Job")),
     *     @OA\Response(response=200, description="更新成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Job"))),
     *     @OA\Response(response=403, description="権限なし", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function update(JobRequest $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        $this->authorize('update', $job);

        $job = $this->jobService->update($job, $request->validated());

        return response()->json(['data' => new JobResource($job)]);
    }

    /**
     * @OA\Delete(
     *     path="/jobs/{id}",
     *     tags={"Job"},
     *     summary="求人削除",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=204, description="削除成功"),
     *     @OA\Response(response=403, description="権限なし", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        $this->authorize('delete', $job);

        $this->jobService->delete($job);

        return response()->json(null, 204);
    }

    /**
     * @OA\Put(
     *     path="/jobs/{id}/status",
     *     tags={"Job"},
     *     summary="求人ステータス変更",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"draft","published","closed"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="更新成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Job"))),
     *     @OA\Response(response=403, description="権限なし", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'in:draft,published,closed']]);

        $job = Job::findOrFail($id);
        $this->authorize('update', $job);

        $job = $this->jobService->updateStatus($job, $request->status);

        return response()->json(['data' => new JobResource($job)]);
    }
}
