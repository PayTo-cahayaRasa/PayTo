<?php

namespace Tests\Feature;

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_production_https_responses_use_strict_security_headers(): void
    {
        config(['app.env' => 'production']);

        $request = Request::create('https://localhost/login');
        $response = (new SecurityHeaders)->handle($request, fn () => new Response);

        $this->assertSame('max-age=31536000; includeSubDomains', $response->headers->get('Strict-Transport-Security'));
        $csp = (string) $response->headers->get('Content-Security-Policy');
        $this->assertStringContainsString("object-src 'none'", $csp);
        $this->assertStringNotContainsString("'unsafe-eval'", $csp);
    }
}
