const ROLES_STORAGE_KEY = 'retailOps.roles.v1';
const CURRENT_ROLE_STORAGE_KEY = 'retailOps.currentRole.v1';

export const DASHBOARD_TABS = [
    { id: 'priority', label: 'Store Locations' },
    { id: 'fulfillment', label: 'Fulfillment' },
    { id: 'intelligence', label: 'Intelligence' },
];

const DEFAULT_ROLES = [
    {
        id: 'administrator',
        name: 'Administrator',
        permissions: ['priority', 'fulfillment', 'intelligence'],
        system: true,
    },
    {
        id: 'operations-manager',
        name: 'Operations Manager',
        permissions: ['priority', 'fulfillment'],
    },
    {
        id: 'analyst',
        name: 'Analyst',
        permissions: ['priority', 'intelligence'],
    },
    {
        id: 'viewer',
        name: 'Viewer',
        permissions: ['priority'],
    },
];

function cloneDefaultRoles() {
    return DEFAULT_ROLES.map((role) => ({
        ...role,
        permissions: [...role.permissions],
    }));
}

function normalizeRoles(value) {
    if (!Array.isArray(value)) return cloneDefaultRoles();

    const validTabs = new Set(DASHBOARD_TABS.map((tab) => tab.id));
    const roles = value
        .filter((role) => role && typeof role.id === 'string' && typeof role.name === 'string')
        .map((role) => ({
            id: role.id.trim(),
            name: role.name.trim().slice(0, 50),
            permissions: Array.isArray(role.permissions)
                ? [...new Set(role.permissions.filter((permission) => validTabs.has(permission)))]
                : [],
            system: role.id === 'administrator',
        }))
        .filter((role) => role.id && role.name);

    const administrator = roles.find((role) => role.id === 'administrator');
    if (administrator) {
        administrator.name = 'Administrator';
        administrator.permissions = DASHBOARD_TABS.map((tab) => tab.id);
        administrator.system = true;
    } else {
        roles.unshift(cloneDefaultRoles()[0]);
    }

    return roles;
}

export function getRoles() {
    try {
        return normalizeRoles(JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || 'null'));
    } catch (error) {
        console.warn('[PERMISSIONS] Stored roles could not be loaded:', error);
        return cloneDefaultRoles();
    }
}

export function saveRoles(roles) {
    const normalized = normalizeRoles(roles);
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
}

export function getCurrentRoleId() {
    const roles = getRoles();
    const storedRoleId = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY);
    return roles.some((role) => role.id === storedRoleId) ? storedRoleId : 'administrator';
}

export function setCurrentRoleId(roleId) {
    const roles = getRoles();
    const nextRoleId = roles.some((role) => role.id === roleId) ? roleId : 'administrator';
    localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, nextRoleId);
    window.dispatchEvent(new CustomEvent('permissionschange', { detail: { roleId: nextRoleId } }));
}

export function getCurrentRole() {
    const roleId = getCurrentRoleId();
    return getRoles().find((role) => role.id === roleId);
}

export function canViewTab(tabId) {
    return getCurrentRole()?.permissions.includes(tabId) === true;
}

export function canManageRoles() {
    return getCurrentRoleId() === 'administrator';
}

export function getFirstAllowedTab() {
    return DASHBOARD_TABS.find((tab) => canViewTab(tab.id))?.id || null;
}

export function createRoleId(name) {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'role';
    const existingIds = new Set(getRoles().map((role) => role.id));
    let id = base;
    let suffix = 2;

    while (existingIds.has(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
    }

    return id;
}
