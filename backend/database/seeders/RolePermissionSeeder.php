<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            ['name' => 'Manage Users', 'slug' => 'manage-users', 'description' => 'Create, edit and delete users'],
            ['name' => 'View Analytics', 'slug' => 'view-analytics', 'description' => 'View system analytics and reports'],
            ['name' => 'Manage Finances', 'slug' => 'manage-finances', 'description' => 'Handle financial operations'],
            ['name' => 'Operate System', 'slug' => 'operate-system', 'description' => 'General system operations'],
        ];

        foreach ($permissions as $p) {
            Permission::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // 2. Create Roles
        $adminRole = Role::updateOrCreate(['slug' => 'admin'], [
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Full system access',
        ]);

        $accountantRole = Role::updateOrCreate(['slug' => 'accountant'], [
            'name' => 'Accountant',
            'slug' => 'accountant',
            'description' => 'Financial data access',
        ]);

        $operatorRole = Role::updateOrCreate(['slug' => 'operator'], [
            'name' => 'Operator',
            'slug' => 'operator',
            'description' => 'Standard operational access',
        ]);

        // 3. Sync Permissions to Roles
        $adminRole->permissions()->sync(Permission::all());
        $accountantRole->permissions()->sync(Permission::whereIn('slug', ['view-analytics', 'manage-finances'])->get());
        $operatorRole->permissions()->sync(Permission::whereIn('slug', ['operate-system', 'view-analytics'])->get());

        // 4. Create a Default Admin User if none exists
        $admin = User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
        ]);

        $admin->roles()->sync([$adminRole->id]);
    }
}
