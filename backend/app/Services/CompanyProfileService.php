<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CompanyProfileService
{
    public function uploadPhoto(User $user, UploadedFile $file): array
    {
        $path = $file->store('company-photos', 'public');

        return [
            'id' => basename($path),
            'url' => asset('storage/' . $path),
        ];
    }

    public function deletePhoto(User $user, string $photoId): void
    {
        $path = 'company-photos/' . $photoId;
        Storage::disk('public')->delete($path);
    }
}
