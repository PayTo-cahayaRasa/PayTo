<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\ResetPinRequest;
use App\Http\Requests\SendPasswordResetLinkRequest;
use App\Models\User;
use App\Notifications\PinResetNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Response;

class PasswordResetController extends Controller
{
    public function requestPage(): Response
    {
        return inertia('auth/forgot-password', ['mode' => 'password']);
    }

    public function pinRequestPage(): Response
    {
        return inertia('auth/forgot-password', ['mode' => 'pin']);
    }

    public function send(SendPasswordResetLinkRequest $request): RedirectResponse
    {
        $email = strtolower((string) $request->validated('email'));
        $user = User::query()->where('email', $email)->where('is_active', true)->first();

        if ($user) {
            Password::sendResetLink(['email' => $email]);
        }

        return back()->with('status', 'Jika email terdaftar, tautan reset telah dikirim.');
    }

    public function resetPage(string $token): Response
    {
        return inertia('auth/reset-password', ['token' => $token, 'email' => request('email', '')]);
    }

    public function reset(ResetPasswordRequest $request): RedirectResponse
    {
        $status = Password::reset($request->validated(), function (User $user, string $password): void {
            $user->forceFill(['password_hash' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return back()->withErrors(['email' => __($status)]);
        }

        return redirect()->route('login')->with('status', 'Password berhasil diubah. Silakan login kembali.');
    }

    public function sendPin(SendPasswordResetLinkRequest $request): RedirectResponse
    {
        $email = strtolower((string) $request->validated('email'));
        $user = User::query()->where('email', $email)->where('is_active', true)->first();

        if ($user) {
            /** @var \Illuminate\Auth\Passwords\PasswordBroker $broker */
            $broker = Password::broker('pins');
            $token = $broker->createToken($user);
            $user->notify(new PinResetNotification($token));
        }

        return back()->with('status', 'Jika email terdaftar, tautan reset PIN telah dikirim.');
    }

    public function resetPinPage(string $token): Response
    {
        return inertia('auth/reset-pin', ['token' => $token, 'email' => request('email', '')]);
    }

    public function resetPin(ResetPinRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $credentials = [
            'token' => $payload['token'],
            'email' => $payload['email'],
            'password' => $payload['pin'],
            'password_confirmation' => $payload['pin_confirmation'],
        ];

        $status = Password::broker('pins')->reset($credentials, function (User $user, string $pin): void {
            $user->forceFill(['pin_hash' => Hash::make($pin)])->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            return back()->withErrors(['email' => __($status)]);
        }

        return redirect()->route('login')->with('status', 'PIN berhasil diubah. Silakan login kembali.');
    }
}
