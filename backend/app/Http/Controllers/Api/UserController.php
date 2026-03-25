<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the users with their roles.
     */
    public function index(): JsonResponse
    {
        $users = User::with(['roles', 'company', 'branch'])->get();
        return response()->json($users);
    }

    /**
     * Update user details (roles, company, branch).
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'sometimes|required|string',
            'email'      => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role_ids'   => 'sometimes|array',
            'role_ids.*' => 'exists:roles,id',
            'company_id' => 'nullable|exists:companies,id',
            'branch_id'  => 'nullable|exists:branches,id',
        ]);

        $user->update($request->only('name', 'email', 'company_id', 'branch_id'));

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->load('roles', 'company', 'branch')
        ]);
    }

    /**
     * Get all available roles.
     */
    public function getRoles(): JsonResponse
    {
        return response()->json(Role::all());
    }

    /**
     * Show a single user with roles, company and branch.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('roles', 'roles.permissions', 'company', 'branch'));
    }

    /**
     * Delete a user.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->hasRole('admin') && User::role('admin')->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the only administrative user.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}
