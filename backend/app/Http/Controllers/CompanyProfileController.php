<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyProfileRequest;
use App\Http\Resources\CompanyProfileResource;
use App\Http\Resources\JobResource;
use App\Models\CompanyProfile;
use App\Services\CompanyProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyProfileController extends Controller
{
    public function __construct(private CompanyProfileService $companyProfileService) {}
    /**
     * @OA\Get(
     *     path="/companies/{id}",
     *     tags={"Company"},
     *     summary="企業プロフィール詳細（公開）",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 allOf={
     *                     @OA\Schema(ref="#/components/schemas/CompanyProfile"),
     *                     @OA\Schema(
     *                         @OA\Property(property="jobs", type="array", @OA\Items(ref="#/components/schemas/Job"))
     *                     )
     *                 }
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $profile = CompanyProfile::with(['prefecture', 'user'])
            ->findOrFail($id);

        $jobs = $profile->jobs()->published()
            ->with(['jobCategory', 'prefecture'])
            ->get();

        return response()->json([
            'data' => array_merge(
                (new CompanyProfileResource($profile))->toArray($request),
                ['jobs' => JobResource::collection($jobs)]
            ),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/companies/me",
     *     tags={"Company"},
     *     summary="自社プロフィール取得",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/CompanyProfile"))
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function showMe(Request $request): JsonResponse
    {
        $profile = $request->user()
            ->companyProfile()
            ->with(['prefecture'])
            ->firstOrFail();

        return response()->json(['data' => new CompanyProfileResource($profile)]);
    }

    /**
     * @OA\Post(
     *     path="/companies/me",
     *     tags={"Company"},
     *     summary="企業プロフィール作成",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="industry", type="string", nullable=true),
     *             @OA\Property(property="employee_count", type="integer", nullable=true),
     *             @OA\Property(property="prefecture_id", type="string", nullable=true),
     *             @OA\Property(property="address", type="string", nullable=true),
     *             @OA\Property(property="description", type="string", nullable=true),
     *             @OA\Property(property="disabled_hire_count", type="integer"),
     *             @OA\Property(property="considerations", ref="#/components/schemas/Considerations", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="作成成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/CompanyProfile"))),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function store(CompanyProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->companyProfile()->create($request->validated());

        return response()->json(['data' => new CompanyProfileResource($profile)], 201);
    }

    /**
     * @OA\Put(
     *     path="/companies/me",
     *     tags={"Company"},
     *     summary="企業プロフィール更新",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CompanyProfile")
     *     ),
     *     @OA\Response(response=200, description="更新成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/CompanyProfile"))),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function update(CompanyProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->companyProfile;
        $profile->update($request->validated());

        return response()->json(['data' => new CompanyProfileResource($profile->load('prefecture'))]);
    }

    /**
     * @OA\Post(
     *     path="/companies/me/photos",
     *     tags={"Company"},
     *     summary="企業写真アップロード",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file"},
     *                 @OA\Property(property="file", type="string", format="binary", description="JPEG/PNG・5MB以下")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="アップロード成功",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="string"),
     *                 @OA\Property(property="url", type="string")
     *             )
     *         )
     *     )
     * )
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,png', 'max:5120'],
        ]);

        $photo = $this->companyProfileService->uploadPhoto($request->user(), $request->file('file'));

        return response()->json(['data' => $photo], 201);
    }

    /**
     * @OA\Delete(
     *     path="/companies/me/photos/{id}",
     *     tags={"Company"},
     *     summary="企業写真削除",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=204, description="削除成功"),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function deletePhoto(Request $request, string $id): JsonResponse
    {
        $this->companyProfileService->deletePhoto($request->user(), $id);

        return response()->json(null, 204);
    }
}
