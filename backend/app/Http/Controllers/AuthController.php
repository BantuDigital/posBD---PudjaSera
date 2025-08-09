<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Link reset password telah dikirim ke email Anda.']);
        }
        return response()->json(['message' => 'Gagal mengirim link reset password.'], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|confirmed',
        ]);
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                    'remember_token' => Str::random(60),
                ])->save();
                event(new PasswordReset($user));
            }
        );
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password berhasil direset.']);
        }
        return response()->json(['message' => 'Token tidak valid atau sudah expired.'], 400);
    }

}
