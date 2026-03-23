<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobseekerProfileRequest;
use App\Http\Resources\JobseekerProfileResource;
use App\Models\JobseekerProfile;
use App\Services\JobseekerProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobseekerProfileController extends Controller
{
    public function __construct(private JobseekerProfileService $jobseekerProfileService) {}
    /**
     * @OA\Get(
     *     path="/jobseekers",
     *     tags={"Jobseeker"},
     *     summary="求職者一覧（公開）",
     *     @OA\Parameter(name="disability_type_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="job_category_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="prefecture_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="work_style", in="query", @OA\Schema(type="string", enum={"full_time","part_time","remote","hybrid"})),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", default=20)),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/JobseekerProfile")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobseekerProfile::public()
            ->with(['disabilityType', 'desiredJobCategory', 'prefecture']);

        if ($request->disability_type_id) {
            $query->where('disability_type_id', $request->disability_type_id);
        }
        if ($request->job_category_id) {
            $query->where('desired_job_category_id', $request->job_category_id);
        }
        if ($request->prefecture_id) {
            $query->where('prefecture_id', $request->prefecture_id);
        }
        if ($request->work_style) {
            $query->where('desired_work_style', $request->work_style);
        }

        $perPage = (int) ($request->per_page ?? 20);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => JobseekerProfileResource::collection($paginated->items()),
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
     *     path="/jobseekers/{id}",
     *     tags={"Jobseeker"},
     *     summary="求職者プロフィール詳細（公開）",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/JobseekerProfile"))
     *     ),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $profile = JobseekerProfile::public()
            ->with(['disabilityType', 'desiredJobCategory', 'prefecture', 'user'])
            ->findOrFail($id);

        return response()->json(['data' => new JobseekerProfileResource($profile)]);
    }

    /**
     * @OA\Get(
     *     path="/jobseekers/me",
     *     tags={"Jobseeker"},
     *     summary="自分のプロフィール取得",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/JobseekerProfile"))
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function showMe(Request $request): JsonResponse
    {
        $profile = $request->user()
            ->jobseekerProfile()
            ->with(['disabilityType', 'desiredJobCategory', 'prefecture'])
            ->firstOrFail();

        return response()->json(['data' => new JobseekerProfileResource($profile)]);
    }

    /**
     * @OA\Post(
     *     path="/jobseekers/me",
     *     tags={"Jobseeker"},
     *     summary="プロフィール作成",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"last_name","first_name","last_name_kana","first_name_kana"},
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name_kana", type="string"),
     *             @OA\Property(property="first_name_kana", type="string"),
     *             @OA\Property(property="birth_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, nullable=true),
     *             @OA\Property(property="prefecture_id", type="string", nullable=true),
     *             @OA\Property(property="disability_type_id", type="string", nullable=true),
     *             @OA\Property(property="disability_grade", type="string", nullable=true),
     *             @OA\Property(property="desired_job_category_id", type="string", nullable=true),
     *             @OA\Property(property="desired_employment_type", type="string", enum={"general","special_subsidiary","support"}, nullable=true),
     *             @OA\Property(property="desired_work_style", type="string", enum={"full_time","part_time","remote","hybrid"}, nullable=true),
     *             @OA\Property(property="desired_salary", type="integer", nullable=true),
     *             @OA\Property(property="self_pr", type="string", nullable=true),
     *             @OA\Property(property="is_public", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="作成成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/JobseekerProfile"))),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse"),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function store(JobseekerProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->jobseekerProfile()->create($request->validated());

        return response()->json(['data' => new JobseekerProfileResource($profile)], 201);
    }

    /**
     * @OA\Put(
     *     path="/jobseekers/me",
     *     tags={"Jobseeker"},
     *     summary="プロフィール更新",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/JobseekerProfile")
     *     ),
     *     @OA\Response(response=200, description="更新成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/JobseekerProfile"))),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function update(JobseekerProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->jobseekerProfile;
        $profile->update($request->validated());

        return response()->json(['data' => new JobseekerProfileResource($profile->load(['disabilityType', 'desiredJobCategory', 'prefecture']))]);
    }

    /**
     * @OA\Post(
     *     path="/jobseekers/me/resume",
     *     tags={"Jobseeker"},
     *     summary="履歴書アップロード",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file"},
     *                 @OA\Property(property="file", type="string", format="binary", description="PDFのみ・10MB以下")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="アップロード成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object", @OA\Property(property="resume_url", type="string"))
     *         )
     *     ),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function uploadResume(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $resumeUrl = $this->jobseekerProfileService->uploadResume($request->user(), $request->file('file'));

        return response()->json(['data' => ['resume_url' => $resumeUrl]]);
    }

    /**
     * @OA\Delete(
     *     path="/jobseekers/me/resume",
     *     tags={"Jobseeker"},
     *     summary="履歴書削除",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=204, description="削除成功"),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function deleteResume(Request $request): JsonResponse
    {
        $this->jobseekerProfileService->deleteResume($request->user());

        return response()->json(null, 204);
    }
}
