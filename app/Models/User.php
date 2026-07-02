<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'last_login_at',
        'last_logout_at',
        'work_date',
        'work_seconds',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'password_hash',
        'pin_hash',
        'supervisor_pin_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'last_logout_at' => 'datetime',
            'work_date' => 'date',
            'work_seconds' => 'integer',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'password_hash' => 'hashed',
            'pin_hash' => 'hashed',
        ];
    }

    /**
     * Attempt to retrieve an active user for the given credential pair.
     */
    public static function fetchForLogin(string $username, string $plainPassword, ?string $role = null): ?self
    {
        $user = static::query()
            ->when($role, fn (Builder $query) => $query->where('role', $role))
            ->where('username', $username)
            ->where('is_active', true)
            ->first();

        if (! $user) {
            return null;
        }

        return Hash::check($plainPassword, $user->password_hash) ? $user : null;
    }

    /**
     * Attempt to retrieve an active user for the given PIN.
     */
    public static function fetchForPin(string $plainPin, ?string $role = null): ?self
    {
        $matchedUser = null;
        $candidates = static::query()
            ->when($role, fn (Builder $query) => $query->where('role', $role))
            ->whereNotNull('pin_hash')
            ->where('is_active', true)
            ->cursor();

        foreach ($candidates as $user) {
            if (Hash::check($plainPin, $user->pin_hash) && $matchedUser === null) {
                $matchedUser = $user;
            }
        }

        return $matchedUser;
    }
}
