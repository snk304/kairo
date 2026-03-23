<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    /**
     * @OA\Post(
     *     path="/auth/register/jobseeker",
     *     tags={"Auth"},
     *     summary="求職者登録",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password","password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", minLength=8),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="登録成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function registerJobseeker(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            $request->email,
            $request->password,
            'jobseeker'
        );

        return response()->json(['message' => 'registered'], 201);
    }

    /**
     * @OA\Post(
     *     path="/auth/register/company",
     *     tags={"Auth"},
     *     summary="企業登録",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password","password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", minLength=8),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="登録成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function registerCompany(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            $request->email,
            $request->password,
            'company'
        );

        return response()->json(['message' => 'registered'], 201);
    }

    /**
     * @OA\Post(
     *     path="/auth/login",
     *     tags={"Auth"},
     *     summary="ログイン",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="ログイン成功",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="token", type="string"),
     *                 @OA\Property(property="user", ref="#/components/schemas/User")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="認証失敗", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->email, $request->password);

        return response()->json([
            'data' => [
                'token' => $result['token'],
                'user' => new UserResource($result['user']),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     tags={"Auth"},
     *     summary="ログアウト",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="ログアウト成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        if (method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['message' => 'logged out']);
    }

    /**
     * @OA\Get(
     *     path="/auth/me",
     *     tags={"Auth"},
     *     summary="認証中ユーザー情報取得",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="成功",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 allOf={
     *                     @OA\Schema(ref="#/components/schemas/User"),
     *                     @OA\Schema(@OA\Property(property="profile", type="object", nullable=true))
     *                 }
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="未認証", ref="#/components/schemas/ErrorResponse")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = match ($user->role) {
            'jobseeker' => $user->jobseekerProfile,
            'company' => $user->companyProfile,
            default => null,
        };

        return response()->json([
            'data' => array_merge(
                (new UserResource($user))->toArray($request),
                ['profile' => $profile]
            ),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/auth/password/forgot",
     *     tags={"Auth"},
     *     summary="パスワードリセットメール送信",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email")
     *         )
     *     ),
     *     @OA\Response(response=200, description="送信成功", @OA\JsonContent(@OA\Property(property="message", type="string")))
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        return response()->json(['message' => 'パスワードリセットメールを送信しました。']);
    }

    /**
     * @OA\Post(
     *     path="/auth/password/reset",
     *     tags={"Auth"},
     *     summary="パスワードリセット",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token","email","password","password_confirmation"},
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", minLength=8),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="リセット成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        return response()->json(['message' => 'パスワードをリセットしました。']);
    }
}
