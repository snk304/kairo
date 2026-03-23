<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'senderId' => $this->sender_id,
            'body' => $this->body,
            'isRead' => $this->is_read,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
