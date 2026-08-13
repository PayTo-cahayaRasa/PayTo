<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PinResetNotification extends Notification
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
            ->subject('Reset PIN Cahaya Rasa')
            ->line('Anda menerima email ini karena ada permintaan reset PIN.')
            ->action('Reset PIN', url('/reset-pin/'.$this->token.'?email='.urlencode($notifiable->getEmailForPasswordReset())))
            ->line('Tautan reset PIN berlaku selama 60 menit.');
    }
}
