<?php

namespace App\Http\Controllers;

use App\Http\Requests\MessageRequest;
use App\Http\Resources\MessageResource;
use App\Http\Resources\ThreadResource;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    /**
     * @OA\Get(
     *     path="/threads",
     *     tags={"Message"},
     *     summary="スレッド一覧",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Thread")),
     *             @OA\Property(property="meta", ref="#/components/schemas/PaginationMeta")
     *         )
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $threads = Thread::where('jobseeker_id', $user->id)
            ->orWhere('company_id', $user->id)
            ->with(['jobseeker.jobseekerProfile', 'company.companyProfile', 'latestMessage'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => ThreadResource::collection($threads->items()),
            'meta' => [
                'current_page' => $threads->currentPage(),
                'per_page' => $threads->perPage(),
                'total' => $threads->total(),
                'last_page' => $threads->lastPage(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/threads/{id}",
     *     tags={"Message"},
     *     summary="スレッド詳細（メッセージ含む）",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/Thread"),
     *                 @OA\Schema(
     *                     @OA\Property(property="messages", type="array", @OA\Items(ref="#/components/schemas/Message"))
     *                 )
     *             }
     *         )
     *     ),
     *     @OA\Response(response=403, description="自分のスレッドのみ参照可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $thread = Thread::with(['jobseeker.jobseekerProfile', 'company.companyProfile', 'messages'])
            ->findOrFail($id);

        $this->authorize('view', $thread);

        return response()->json([
            'data' => array_merge(
                (new ThreadResource($thread))->toArray($request),
                ['messages' => MessageResource::collection($thread->messages)]
            ),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/threads",
     *     tags={"Message"},
     *     summary="スレッド作成",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"opponent_id"},
     *             @OA\Property(property="opponent_id", type="string", description="相手のユーザーID"),
     *             @OA\Property(property="scout_id", type="string", nullable=true),
     *             @OA\Property(property="application_id", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="作成成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Thread"))),
     *     @OA\Response(response=422, description="無効な組み合わせ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'opponent_id' => ['required', 'exists:users,id'],
            'scout_id' => ['nullable', 'exists:scouts,id'],
            'application_id' => ['nullable', 'exists:applications,id'],
        ]);

        $user = $request->user();
        $opponent = User::findOrFail($request->opponent_id);

        $validPair = ($user->isJobseeker() && $opponent->isCompany())
                  || ($user->isCompany() && $opponent->isJobseeker());

        if (!$validPair) {
            return response()->json(['message' => 'Invalid opponent role.'], 422);
        }

        $opponentId = $opponent->id;

        $jobseekerId = $user->isJobseeker() ? $user->id : $opponentId;
        $companyId = $user->isCompany() ? $user->id : $opponentId;

        $thread = Thread::firstOrCreate(
            [
                'jobseeker_id' => $jobseekerId,
                'company_id' => $companyId,
            ],
            [
                'scout_id' => $request->scout_id,
                'application_id' => $request->application_id,
            ]
        );

        return response()->json(['data' => new ThreadResource($thread->load(['jobseeker.jobseekerProfile', 'company.companyProfile']))], 201);
    }

    /**
     * @OA\Post(
     *     path="/threads/{id}/messages",
     *     tags={"Message"},
     *     summary="メッセージ送信",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="スレッドID", @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"body"},
     *             @OA\Property(property="body", type="string", maxLength=5000)
     *         )
     *     ),
     *     @OA\Response(response=201, description="送信成功", @OA\JsonContent(@OA\Property(property="data", ref="#/components/schemas/Message"))),
     *     @OA\Response(response=403, description="自分のスレッドのみ投稿可", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function sendMessage(MessageRequest $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);
        $this->authorize('view', $thread);

        $user = $request->user();

        $message = Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $user->id,
            'body' => $request->body,
        ])->refresh();

        $recipientId = $thread->jobseeker_id === $user->id
            ? $thread->company_id
            : $thread->jobseeker_id;

        Notification::create([
            'user_id' => $recipientId,
            'type' => 'message_received',
            'data' => [
                'thread_id' => $thread->id,
                'message_id' => $message->id,
            ],
        ]);

        return response()->json(['data' => new MessageResource($message)], 201);
    }

    /**
     * @OA\Put(
     *     path="/threads/{id}/read",
     *     tags={"Message"},
     *     summary="スレッドを既読にする",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=403, description="自分のスレッドのみ", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);
        $this->authorize('view', $thread);

        $thread->messages()
            ->where('is_read', false)
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'marked as read']);
    }
}
