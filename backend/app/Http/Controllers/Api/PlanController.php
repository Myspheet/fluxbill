<?php

namespace App\Http\Controllers\Api;

use App\Domain\Plans\Models\Plan;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlanRequest;
use App\Http\Requests\UpdatePlanRequest;
use App\Http\Resources\PlanResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;


class PlanController extends Controller
{
    /**
     * List plans
     *
     * Returns the authenticated merchant's plans (tenant-scoped).
     */
    public function index(): AnonymousResourceCollection
    {
        return PlanResource::collection(
            Plan::latest()->get()
        );
    }

    /**
     * Create a plan
     *
     * `amount` is in kobo (e.g. 500000 = ₦5,000). The plan is created for the
     * authenticated merchant.
     */
    public function store(StorePlanRequest $request): JsonResponse
    {
        
        $plan = Plan::create($request->validated());
        $plan->refresh();

        return (new PlanResource($plan))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get a plan
     *
     * Returns 404 if the plan does not exist or belongs to another merchant.
     */
    public function show(string $id): PlanResource
    {
        return new PlanResource(Plan::findOrFail($id));
    }

    /**
     * Update a plan
     *
     * Partial update. Set `status` to `archived` to archive instead of deleting.
     */
    public function update(UpdatePlanRequest $request, string $id): PlanResource
    {
        $plan = Plan::findOrFail($id);
        $plan->update($request->validated());

        return new PlanResource($plan);
    }

    /**
     * Archive a plan
     *
     * DELETE archives (never hard-deletes) so historical invoices stay intact.
     */
    public function destroy(string $id): PlanResource
    {
        $plan = Plan::findOrFail($id);
        $plan->update(['status' => 'archived']);

        return new PlanResource($plan);
    }
}
