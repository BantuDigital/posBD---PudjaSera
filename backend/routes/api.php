<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/



use App\Http\Controllers\COGSController;
use App\Http\Controllers\BuyerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{productId}/cogs', [COGSController::class, 'index']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);


    Route::get('/products/{productId}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/restock/{productId}', [ProductController::class, 'restock']);
    Route::put('/products/{productId}', [ProductController::class, 'update']);

    Route::get('/buyers', [BuyerController::class, 'index']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/{transaction}/status', [TransactionController::class, 'status']);
});

