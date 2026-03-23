<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class JobseekerProfileService
{
    public function uploadResume(User $user, UploadedFile $file): string
    {
        $profile = $user->jobseekerProfile;

        if ($profile->resume_path) {
            Storage::delete($profile->resume_path);
        }

        $path = $file->store('resumes');
        $profile->update(['resume_path' => $path]);

        return Storage::url($path);
    }

    public function deleteResume(User $user): void
    {
        $profile = $user->jobseekerProfile;

        if ($profile->resume_path) {
            Storage::delete($profile->resume_path);
            $profile->update(['resume_path' => null]);
        }
    }
}
