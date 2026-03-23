<?php

namespace App\OpenApi;

/**
 * @OA\Info(
 *     title="Fitto API",
 *     version="1.0.0",
 *     description="身体障害のある求職者と企業をつなぐ配慮マッチングプラットフォーム"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="ローカル開発環境"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 *
 * @OA\Schema(
 *     schema="PaginationMeta",
 *     @OA\Property(property="current_page", type="integer", example=1),
 *     @OA\Property(property="per_page", type="integer", example=20),
 *     @OA\Property(property="total", type="integer", example=100),
 *     @OA\Property(property="last_page", type="integer", example=5)
 * )
 *
 * @OA\Schema(
 *     schema="MasterItem",
 *     @OA\Property(property="id", type="string", example="01JXXXXXXXXXXXXXXXXXXXXXXXXX"),
 *     @OA\Property(property="name", type="string", example="肢体不自由")
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *     @OA\Property(property="id", type="string", example="01JXXXXXXXXXXXXXXXXXXXXXXXXX"),
 *     @OA\Property(property="email", type="string", format="email", example="user@example.com"),
 *     @OA\Property(property="role", type="string", enum={"jobseeker","company","admin"})
 * )
 *
 * @OA\Schema(
 *     schema="JobseekerProfile",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="first_name", type="string"),
 *     @OA\Property(property="last_name", type="string"),
 *     @OA\Property(property="disability_type", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="disability_grade", type="string", nullable=true),
 *     @OA\Property(property="desired_job_category", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="prefecture", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="desired_work_style", type="string", enum={"full_time","part_time","remote","hybrid"}, nullable=true),
 *     @OA\Property(property="desired_employment_type", type="string", enum={"general","special_subsidiary","support"}, nullable=true),
 *     @OA\Property(property="desired_salary", type="integer", nullable=true),
 *     @OA\Property(property="self_pr", type="string", nullable=true),
 *     @OA\Property(property="is_public", type="boolean"),
 *     @OA\Property(property="email", type="string", description="企業ログイン時のみ", nullable=true),
 *     @OA\Property(property="resume_url", type="string", description="企業ログイン時のみ（30分で失効）", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="CompanyProfile",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="industry", type="string", nullable=true),
 *     @OA\Property(property="employee_count", type="integer", nullable=true),
 *     @OA\Property(property="prefecture", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="address", type="string", nullable=true),
 *     @OA\Property(property="description", type="string", nullable=true),
 *     @OA\Property(property="disabled_hire_count", type="integer"),
 *     @OA\Property(property="considerations", ref="#/components/schemas/Considerations", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Considerations",
 *     @OA\Property(property="facility", type="array", @OA\Items(type="string"), nullable=true),
 *     @OA\Property(property="work_style", type="array", @OA\Items(type="string"), nullable=true),
 *     @OA\Property(property="communication", type="array", @OA\Items(type="string"), nullable=true),
 *     @OA\Property(property="equipment", type="array", @OA\Items(type="string"), nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Job",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="title", type="string"),
 *     @OA\Property(property="company", ref="#/components/schemas/CompanyProfile"),
 *     @OA\Property(property="job_category", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="description", type="string", nullable=true),
 *     @OA\Property(property="employment_type", type="string", enum={"full_time","part_time","contract","dispatch"}, nullable=true),
 *     @OA\Property(property="work_style", type="string", enum={"office","remote","hybrid"}, nullable=true),
 *     @OA\Property(property="salary_min", type="integer", nullable=true),
 *     @OA\Property(property="salary_max", type="integer", nullable=true),
 *     @OA\Property(property="prefecture", ref="#/components/schemas/MasterItem", nullable=true),
 *     @OA\Property(property="considerations", ref="#/components/schemas/Considerations", nullable=true),
 *     @OA\Property(property="status", type="string", enum={"draft","published","closed"}),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Application",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="job", ref="#/components/schemas/Job"),
 *     @OA\Property(property="status", type="string", enum={"applied","screening","interview","offered","rejected"}),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Scout",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="company", ref="#/components/schemas/CompanyProfile", nullable=true),
 *     @OA\Property(property="jobseeker", ref="#/components/schemas/JobseekerProfile", nullable=true),
 *     @OA\Property(property="job", ref="#/components/schemas/Job", nullable=true),
 *     @OA\Property(property="message", type="string"),
 *     @OA\Property(property="status", type="string", enum={"unread","read","replied"}),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Thread",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(
 *         property="opponent",
 *         type="object",
 *         @OA\Property(property="id", type="string"),
 *         @OA\Property(property="name", type="string")
 *     ),
 *     @OA\Property(
 *         property="last_message",
 *         nullable=true,
 *         type="object",
 *         @OA\Property(property="body", type="string"),
 *         @OA\Property(property="created_at", type="string", format="date-time")
 *     ),
 *     @OA\Property(property="unread_count", type="integer")
 * )
 *
 * @OA\Schema(
 *     schema="Message",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="sender_id", type="string"),
 *     @OA\Property(property="body", type="string"),
 *     @OA\Property(property="is_read", type="boolean"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Notification",
 *     @OA\Property(property="id", type="string"),
 *     @OA\Property(property="type", type="string", example="scout_received"),
 *     @OA\Property(property="data", type="object"),
 *     @OA\Property(property="read_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     @OA\Property(property="message", type="string", example="Unauthenticated.")
 * )
 *
 * @OA\Schema(
 *     schema="ValidationErrorResponse",
 *     @OA\Property(property="message", type="string"),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         additionalProperties=@OA\Schema(type="array", @OA\Items(type="string"))
 *     )
 * )
 */
class Schemas
{
}
