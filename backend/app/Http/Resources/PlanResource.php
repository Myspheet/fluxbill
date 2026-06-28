<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Domain\Plans\Models\Plan */
class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'amount' => (int) $this->amount, // kobo
            'currency' => $this->currency,
            'interval' => $this->interval,
            'interval_count' => (int) $this->interval_count,
            'trial_days' => (int) $this->trial_days,
            'status' => $this->status,
            'subscribe_url' => rtrim((string) config('app.frontend_url'), '/').'/subscribe/'.$this->id,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
