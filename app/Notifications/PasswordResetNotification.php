<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Atur Ulang Kata Sandi Cahaya Rasa')
            ->greeting('Halo!')
            ->line('Anda menerima email ini karena ada permintaan untuk mengatur ulang kata sandi akun Anda.')
            ->action('Atur Ulang Kata Sandi', url('/reset-password/'.$this->token.'?email='.urlencode($notifiable->getEmailForPasswordReset())))
            ->line('Tautan pengaturan ulang kata sandi ini berlaku selama 60 menit.')
            ->line('Jika Anda tidak meminta pengaturan ulang kata sandi, tidak perlu melakukan tindakan apa pun.')
            ->salutation('Salam, Cahaya Rasa');
    }
}
