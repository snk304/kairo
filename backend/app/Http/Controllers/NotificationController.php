<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/notifications",
     *     tags={"Notification"},
     *     summary="通知一覧",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Notification")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate(20);

        return response()->json([
            'data' => NotificationResource::collection($notifications->items()),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Put(
     *     path="/notifications/{id}/read",
     *     tags={"Notification"},
     *     summary="通知を既読にする",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Notification"))),
     *     @OA\Response(response=404, description="見つからない", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json(['data' => new NotificationResource($notification)]);
    }

    /**
     * @OA\Put(
     *     path="/notifications/read-all",
     *     tags={"Notification"},
     *     summary="全通知を既読にする",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'all marked as read']);
    }
}
