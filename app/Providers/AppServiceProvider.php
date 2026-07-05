<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
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
        if (App::isProduction()) {
            URL::forceScheme('https');
        }

        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            if (strtoupper((string) $request->input('login_method')) === 'PIN') {
                return Limit::perMinutes(5, 5)->by('pin-login:'.$request->ip());
            }

            return Limit::perMinute(5)->by((string) $request->input('username').'|'.$request->ip());
        });

        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        RateLimiter::for('refund', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        RateLimiter::for('sensitive-action', function (Request $request) {
            return Limit::perMinutes(5, 5)->by('sensitive-action:'.($request->user()?->getAuthIdentifier() ?: $request->ip()));
        });

        RateLimiter::for('catalog', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Admin API rate limiting - prevents abuse of admin endpoints
        RateLimiter::for('admin-api', function (Request $request) {
            return Limit::perMinute(60)->by(
                'admin:'.($request->user()?->getAuthIdentifier() ?: $request->ip())
            );
        });

        // Admin write operations - stricter rate limiting
        RateLimiter::for('admin-write', function (Request $request) {
            return Limit::perMinutes(5, 10)->by(
                'admin-write:'.($request->user()?->getAuthIdentifier() ?: $request->ip())
            );
        });
    }
}
