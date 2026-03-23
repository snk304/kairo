<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScoutRequest;
use App\Http\Resources\ScoutResource;
use App\Models\Scout;
use App\Services\ScoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoutController extends Controller
{
    public function __construct(private ScoutService $scoutService) {}

    /**
     * @OA\Post(
     *     path="/scouts",
     *     tags={"Scout"},
     *     summary="スカウト送信（企業用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"jobseeker_id","message"},
     *             @OA\Property(property="jobseeker_id", type="string"),
     *             @OA\Property(property="job_id", type="string", nullable=true),
     *             @OA\Property(property="message", type="string", maxLength=2000)
     *         )
     *     ),
     *     @OA\Response(response=201, description="送信成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Scout"))),
     *     @OA\Response(response=403, description="企業のみ送信可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function store(ScoutRequest $request): JsonResponse
    {
        $this->authorize('create', Scout::class);

        $scout = $this->scoutService->send($request->user(), $request->validated());

        return response()->json(['data' => new ScoutResource($scout)], 201);
    }

    /**
     * @OA\Get(
     *     path="/scouts/received",
     *     tags={"Scout"},
     *     summary="受信したスカウト一覧（求職者用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Scout")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="求職者のみアクセス可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function received(Request $request): JsonResponse
    {
        if (!$request->user()->isJobseeker()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $scouts = Scout::where('jobseeker_id', $request->user()->id)
            ->with(['company.companyProfile', 'job'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => ScoutResource::collection($scouts->items()),
            'meta' => [
                'current_page' => $scouts->currentPage(),
                'per_page' => $scouts->perPage(),
                'total' => $scouts->total(),
                'last_page' => $scouts->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/scouts/sent",
     *     tags={"Scout"},
     *     summary="送信したスカウト一覧（企業用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Scout")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="企業のみアクセス可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function sent(Request $request): JsonResponse
    {
        if (!$request->user()->isCompany()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $scouts = Scout::where('company_id', $request->user()->id)
            ->with(['jobseeker.jobseekerProfile', 'job'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => ScoutResource::collection($scouts->items()),
            'meta' => [
                'current_page' => $scouts->currentPage(),
                'per_page' => $scouts->perPage(),
                'total' => $scouts->total(),
                'last_page' => $scouts->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Put(
     *     path="/scouts/{id}/read",
     *     tags={"Scout"},
     *     summary="スカウトを既読にする",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Scout"))),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $scout = Scout::where('jobseeker_id', $request->user()->id)->findOrFail($id);
        $scout->update(['status' => 'read']);

        return response()->json(['data' => new ScoutResource($scout)]);
    }

    /**
     * @OA\Put(
     *     path="/scouts/{id}/reply",
     *     tags={"Scout"},
     *     summary="スカウトに返信",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"message"},
     *             @OA\Property(property="message", type="string", maxLength=2000)
     *         )
     *     ),
     *     @OA\Response(response=200, description="返信成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Scout"))),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function reply(Request $request, string $id): JsonResponse
    {
        $request->validate(['message' => ['required', 'string', 'max:2000']]);

        $scout = Scout::where('jobseeker_id', $request->user()->id)->findOrFail($id);
        $scout = $this->scoutService->reply($scout, $request->message);

        return response()->json(['data' => new ScoutResource($scout)]);
    }
}
