<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * @OA\Post(
     *     path="/contacts",
     *     tags={"Contact"},
     *     summary="お問い合わせ送信",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","body"},
     *             @OA\Property(property="name", type="string", maxLength=100),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="body", type="string", maxLength=5000)
     *         )
     *     ),
     *     @OA\Response(response=201, description="送信成功", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *     @OA\Response(response=422, description="バリデーションエラー", ref="#/components/schemas/ValidationErrorResponse")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $contact = Contact::create([
            'user_id' => $request->user()?->id,
            'name' => $request->name,
            'email' => $request->email,
            'body' => $request->body,
        ]);

        return response()->json(['message' => 'お問い合わせを受け付けました。'], 201);
    }
}
