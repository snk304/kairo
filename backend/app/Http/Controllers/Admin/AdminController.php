<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\UserResource;
use App\Models\Application;
use App\Models\Contact;
use App\Models\Job;
use App\Models\Message;
use App\Models\Scout;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/users",
     *     tags={"Admin"},
     *     summary="ユーザー一覧",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="role", in="query", @OA\Schema(type="string", enum={"jobseeker","company","admin"})),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/User")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Put(
     *     path="/admin/users/{id}/suspend",
     *     tags={"Admin"},
     *     summary="ユーザー停止",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="停止成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/User"))),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function suspendUser(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['email_verified_at' => null]);

        return response()->json(['data' => new UserResource($user)]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/users/{id}",
     *     tags={"Admin"},
     *     summary="ユーザー削除",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=204, description="削除成功"),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function deleteUser(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * @OA\Get(
     *     path="/admin/jobs",
     *     tags={"Admin"},
     *     summary="全求人一覧（管理者用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Job")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function jobs(Request $request): JsonResponse
    {
        $jobs = Job::with(['company', 'jobCategory', 'prefecture'])->latest()->paginate(20);

        return response()->json([
            'data' => JobResource::collection($jobs->items()),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
                'last_page' => $jobs->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Put(
     *     path="/admin/jobs/{id}/unpublish",
     *     tags={"Admin"},
     *     summary="求人を強制非公開",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Job"))),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function unpublishJob(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        $job->update(['status' => 'closed']);

        return response()->json(['data' => new JobResource($job->load(['jobCategory', 'prefecture']))]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/jobs/{id}",
     *     tags={"Admin"},
     *     summary="求人削除（管理者用）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=204, description="削除成功"),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function deleteJob(Request $request, string $id): JsonResponse
    {
        Job::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    /**
     * @OA\Get(
     *     path="/admin/contacts",
     *     tags={"Admin"},
     *     summary="お問い合わせ一覧",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function contacts(Request $request): JsonResponse
    {
        $contacts = Contact::latest('created_at')->paginate(20);

        return response()->json([
            'data' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
                'last_page' => $contacts->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/stats",
     *     tags={"Admin"},
     *     summary="統計情報",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_jobseekers", type="integer"),
     *                 @OA\Property(property="total_companies", type="integer"),
     *                 @OA\Property(property="total_jobs", type="integer"),
     *                 @OA\Property(property="total_applications", type="integer"),
     *                 @OA\Property(property="total_scouts", type="integer"),
     *                 @OA\Property(property="total_messages", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="管理者のみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function stats(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_jobseekers' => User::where('role', 'jobseeker')->count(),
                'total_companies' => User::where('role', 'company')->count(),
                'total_jobs' => Job::count(),
                'total_applications' => Application::count(),
                'total_scouts' => Scout::count(),
                'total_messages' => Message::count(),
            ],
        ]);
    }
}
