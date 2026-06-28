<?php

namespace App\Providers;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Stable morph aliases so polymorphic columns (e.g. personal_access_tokens
        // .tokenable_type) store "merchant", decoupled from the class namespace.
        // This keeps domain-grouped models free to move without breaking stored data.
        Relation::morphMap([
            'merchant' => Merchant::class,
        ]);

        // Scramble restricts its docs to local by default; the public API docs are
        // a hackathon deliverable judges must reach, so allow access everywhere.
        Gate::define('viewApiDocs', fn ($user = null) => true);
    }
}
