<?php

namespace App\Domain\Payments\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** Nightly drift check vs Nomba /transactions. */
class ReconciliationLog extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'reconciliation_log';

    protected $fillable = [
        'date_checked',
        'nomba_transaction_count',
        'local_transaction_count',
        'drift_count',
        'drift_details',
    ];

    protected function casts(): array
    {
        return [
            'date_checked' => 'date',
            'nomba_transaction_count' => 'integer',
            'local_transaction_count' => 'integer',
            'drift_count' => 'integer',
            'drift_details' => 'array',
        ];
    }
}
