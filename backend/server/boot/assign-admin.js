const app = require('../../server/server');
const Role = app.models.Role;
const RoleMapping = app.models.RoleMapping;

async function assignAdminRole() {
    const userId = '689040a51880133c0cb00885';
    let role = await Role.findOne({ where: { name: 'admin' } });
    if (!role) {
        role = await Role.create({ name: 'admin' });
        console.log('Created admin role:', role.id);
    }
    await RoleMapping.destroyAll({ principalId: userId, principalType: 'USER' });
    await RoleMapping.create({
        principalType: 'USER',
        principalId: userId,
        roleId: role.id
    });
    console.log(`Assigned admin role to user ${userId}`);
    checkRole();

}
assignAdminRole();


async function checkRole() {
    const roleMapping = await RoleMapping.findOne({ where: { principalId: '689040a51880133c0cb00885', principalType: 'USER' } });
    console.log('RoleMapping:', roleMapping);
}