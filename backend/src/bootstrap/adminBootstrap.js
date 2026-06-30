const User = require('../models/User');

/**
 * One-time bootstrap for initial ADMIN user.
 *
 * Required env vars:
 * - BOOTSTRAP_ADMIN_EMAIL
 * - BOOTSTRAP_ADMIN_PASSWORD
 * - BOOTSTRAP_ADMIN_PHONE (10-digit, starts 6-9)
 * - BOOTSTRAP_ADMIN_DOB (ISO date string)
 * - BOOTSTRAP_ADMIN_FIRST_NAME
 * - BOOTSTRAP_ADMIN_LAST_NAME
 *
 * Optional env vars:
 * - BOOTSTRAP_ADMIN_ROLE (default: ADMIN)
 */
async function adminBootstrap() {
  const {
    BOOTSTRAP_ADMIN_EMAIL,
    BOOTSTRAP_ADMIN_PASSWORD,
    BOOTSTRAP_ADMIN_PHONE,
    BOOTSTRAP_ADMIN_DOB,
    BOOTSTRAP_ADMIN_FIRST_NAME,
    BOOTSTRAP_ADMIN_LAST_NAME
  } = process.env;

  if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
    console.warn('[adminBootstrap] BOOTSTRAP_ADMIN_EMAIL/PASSWORD not set. Skipping.');
    return;
  }

  // Validate minimal schema inputs
  if (!BOOTSTRAP_ADMIN_PHONE || !BOOTSTRAP_ADMIN_DOB) {
    console.warn(
      '[adminBootstrap] Missing BOOTSTRAP_ADMIN_PHONE and/or BOOTSTRAP_ADMIN_DOB. Skipping ADMIN bootstrap.'
    );
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(BOOTSTRAP_ADMIN_PHONE)) {
    console.warn(
      `[adminBootstrap] Invalid BOOTSTRAP_ADMIN_PHONE format. Expected 10 digits starting 6-9, got: ${BOOTSTRAP_ADMIN_PHONE}. Skipping.`
    );
    return;
  }

  const dob = new Date(BOOTSTRAP_ADMIN_DOB);
  if (Number.isNaN(dob.getTime())) {
    console.warn('[adminBootstrap] Invalid BOOTSTRAP_ADMIN_DOB. Skipping ADMIN bootstrap.');
    return;
  }

  const firstName = BOOTSTRAP_ADMIN_FIRST_NAME || 'Admin';
  const lastName = BOOTSTRAP_ADMIN_LAST_NAME || 'User';
  const email = BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const role = process.env.BOOTSTRAP_ADMIN_ROLE || 'ADMIN';
  const bootstrapFields = {
    firstName,
    lastName,
    phone: BOOTSTRAP_ADMIN_PHONE,
    password: BOOTSTRAP_ADMIN_PASSWORD,
    dateOfBirth: dob,
    role,
    isEmailVerified: true,
    accountStatus: 'ACTIVE',
    profileCompletedAt: new Date(),
    accountStatusUpdatedAt: new Date()
  };

  // If an admin already exists, keep bootstrap idempotent and do not create duplicates.
  const existingAdmin = await User.findOne({ role: 'ADMIN' }).select('_id email');
  if (existingAdmin) {
    console.log('[adminBootstrap] ADMIN already exists. Skipping bootstrap.', {
      id: existingAdmin._id.toString(),
      email: existingAdmin.email
    });
    return;
  }

  // If the configured email already exists, make that exact account the bootstrap admin.
  const existingByEmail = await User.findOne({ email }).select('+password');
  if (existingByEmail) {
    Object.assign(existingByEmail, bootstrapFields);
    await existingByEmail.save();

    console.log('[adminBootstrap] Existing bootstrap email promoted to ADMIN:', {
      id: existingByEmail._id.toString(),
      email: existingByEmail.email,
      role: existingByEmail.role,
      accountStatus: existingByEmail.accountStatus
    });
    return;
  }

  // Phone is unique. If it already belongs to a non-admin and there is no admin,
  // reclaim that record for the configured bootstrap admin instead of crashing.
  const existingByPhone = await User.findOne({ phone: BOOTSTRAP_ADMIN_PHONE }).select('+password');
  if (existingByPhone) {
    const previousEmail = existingByPhone.email;
    Object.assign(existingByPhone, {
      ...bootstrapFields,
      email
    });
    await existingByPhone.save();

    console.warn('[adminBootstrap] BOOTSTRAP_ADMIN_PHONE was already used, so that record was converted to the configured ADMIN:', {
      phone: BOOTSTRAP_ADMIN_PHONE,
      id: existingByPhone._id.toString(),
      previousEmail,
      email: existingByPhone.email,
      role: existingByPhone.role,
      accountStatus: existingByPhone.accountStatus
    });
    return;
  }

  console.log('[adminBootstrap] Creating initial ADMIN user with config:', {
    email,
    phone: BOOTSTRAP_ADMIN_PHONE,
    dob: BOOTSTRAP_ADMIN_DOB,
    firstName,
    lastName,
    role,
    accountStatus: 'ACTIVE',
    isEmailVerified: true
  });

  const adminUser = await User.create({
    email,
    ...bootstrapFields
  });

  console.log('[adminBootstrap] ADMIN user created:', {
    id: adminUser._id.toString(),
    email: adminUser.email,
    role: adminUser.role,
    accountStatus: adminUser.accountStatus
  });
}

module.exports = adminBootstrap;

