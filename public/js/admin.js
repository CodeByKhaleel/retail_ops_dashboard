import {
    DASHBOARD_TABS,
    canManageRoles,
    createRoleId,
    getCurrentRoleId,
    getRoles,
    saveRoles,
    setCurrentRoleId,
} from './permissions.js';

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
}

function renderRoleOptions(roles, currentRoleId) {
    return roles
        .map((role) => `<option value="${role.id}" ${role.id === currentRoleId ? 'selected' : ''}>${escapeHtml(role.name)}</option>`)
        .join('');
}

export const admin = {
    init() {
        this.renderRolePreview();
        window.addEventListener('permissionschange', () => this.renderRolePreview());
    },

    renderRolePreview() {
        const select = document.getElementById('role-preview-select');
        if (!select) return;

        const roles = getRoles();
        select.innerHTML = renderRoleOptions(roles, getCurrentRoleId());
        select.onchange = () => setCurrentRoleId(select.value);
    },

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !canManageRoles()) return;

        const roles = getRoles();
        const currentRoleId = getCurrentRoleId();

        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Access control</p>
                        <h2 class="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Role Management</h2>
                        <p class="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                            Choose which dashboard tabs each role can open. Changes are saved in this browser for the demo.
                        </p>
                    </div>
                    <form id="add-role-form" class="flex w-full gap-2 sm:w-auto">
                        <input id="new-role-name" maxlength="50" required placeholder="New role name"
                            class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-56">
                        <button type="submit"
                            class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700">
                            Add role
                        </button>
                    </form>
                </div>

                <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[720px] text-left">
                            <thead class="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/60">
                                <tr>
                                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                                    ${DASHBOARD_TABS.map((tab) => `
                                        <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">${tab.label}</th>
                                    `).join('')}
                                    <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${roles.map((role) => `
                                    <tr data-role-id="${role.id}">
                                        <td class="px-6 py-5">
                                            <div class="font-bold text-slate-900 dark:text-white">${escapeHtml(role.name)}</div>
                                            <div class="mt-1 text-xs text-slate-400">${role.system ? 'Protected system role' : 'Customizable role'}</div>
                                        </td>
                                        ${DASHBOARD_TABS.map((tab) => `
                                            <td class="px-6 py-5 text-center">
                                                <input type="checkbox" data-permission="${tab.id}"
                                                    ${role.permissions.includes(tab.id) ? 'checked' : ''}
                                                    ${role.system ? 'disabled' : ''}
                                                    aria-label="${escapeHtml(role.name)} can view ${tab.label}"
                                                    class="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50">
                                            </td>
                                        `).join('')}
                                        <td class="px-6 py-5 text-right">
                                            ${role.system ? `
                                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Required</span>
                                            ` : `
                                                <button type="button" data-delete-role="${role.id}"
                                                    class="rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30">
                                                    Delete
                                                </button>
                                            `}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200">
                    Use the <strong>Preview role</strong> selector in the top navigation to verify tab visibility and blocked direct URLs.
                </div>
                <p id="role-admin-status" class="min-h-5 text-sm font-semibold text-emerald-600" role="status"></p>
            </div>
        `;

        this.bindEvents(container, roles, currentRoleId);
    },

    bindEvents(container, roles, currentRoleId) {
        const status = container.querySelector('#role-admin-status');
        const persistFromTable = () => {
            const updatedRoles = roles.map((role) => {
                if (role.system) return role;
                const row = container.querySelector(`[data-role-id="${role.id}"]`);
                return {
                    ...role,
                    permissions: DASHBOARD_TABS
                        .filter((tab) => row?.querySelector(`[data-permission="${tab.id}"]`)?.checked)
                        .map((tab) => tab.id),
                };
            });
            saveRoles(updatedRoles);
            this.renderRolePreview();
            window.dispatchEvent(new CustomEvent('permissionschange', { detail: { roleId: currentRoleId } }));
            if (status) status.textContent = 'Role permissions saved.';
        };

        container.querySelectorAll('[data-permission]').forEach((checkbox) => {
            checkbox.addEventListener('change', persistFromTable);
        });

        container.querySelector('#add-role-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = container.querySelector('#new-role-name');
            const name = input?.value.trim();
            if (!name) return;

            saveRoles([
                ...roles,
                { id: createRoleId(name), name, permissions: ['priority'] },
            ]);
            this.renderRolePreview();
            this.render(container.id);
        });

        container.querySelectorAll('[data-delete-role]').forEach((button) => {
            button.addEventListener('click', () => {
                const roleId = button.dataset.deleteRole;
                saveRoles(roles.filter((role) => role.id !== roleId));
                if (getCurrentRoleId() === roleId) setCurrentRoleId('administrator');
                this.renderRolePreview();
                this.render(container.id);
            });
        });
    },
};
