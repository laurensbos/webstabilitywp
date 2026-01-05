import { pgTable, text, timestamp, integer, boolean, uuid, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  plan: text('plan').default('free'), // free, pro, business
  alertEmail: text('alert_email'),
  alertPhone: text('alert_phone'),
  emailVerified: boolean('email_verified').default(false),
  // Notification preferences (stored as JSON string)
  notifyDowntime: boolean('notify_downtime').default(true),
  notifyRecovery: boolean('notify_recovery').default(true),
  notifySslExpiry: boolean('notify_ssl_expiry').default(true),
  notifyWeeklyReport: boolean('notify_weekly_report').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Monitored Sites
export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
  checkInterval: integer('check_interval').default(5), // minutes
  lastCheckedAt: timestamp('last_checked_at'),
  currentStatus: text('current_status').default('unknown'), // up, down, unknown
  uptimePercentage: decimal('uptime_percentage', { precision: 5, scale: 2 }).default('100.00'),
  avgResponseTime: integer('avg_response_time'), // ms
  // Client email for bureau customers (optional - links site to a bureau client)
  clientEmail: text('client_email'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('sites_user_id_idx').on(table.userId),
  clientEmailIdx: index('sites_client_email_idx').on(table.clientEmail),
}));

// Uptime Checks
export const uptimeChecks = pgTable('uptime_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  status: integer('status'), // HTTP status code
  responseTime: integer('response_time'), // ms
  isUp: boolean('is_up').notNull(),
  error: text('error'),
  checkedAt: timestamp('checked_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('uptime_checks_site_id_idx').on(table.siteId),
  checkedAtIdx: index('uptime_checks_checked_at_idx').on(table.checkedAt),
}));

// Visual Snapshots
export const visualSnapshots = pgTable('visual_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  screenshotUrl: text('screenshot_url').notNull(),
  diffPercentage: decimal('diff_percentage', { precision: 5, scale: 2 }),
  hasChanges: boolean('has_changes').default(false),
  previousSnapshotId: uuid('previous_snapshot_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('visual_snapshots_site_id_idx').on(table.siteId),
}));

// Alerts
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // downtime, visual_change, slow_response, ssl_expiry, security
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').default('warning'), // info, warning, critical
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('alerts_user_id_idx').on(table.userId),
  siteIdIdx: index('alerts_site_id_idx').on(table.siteId),
}));

// Performance Metrics (Lighthouse data)
export const performanceMetrics = pgTable('performance_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  performanceScore: integer('performance_score'),
  accessibilityScore: integer('accessibility_score'),
  bestPracticesScore: integer('best_practices_score'),
  seoScore: integer('seo_score'),
  lcp: decimal('lcp', { precision: 10, scale: 2 }), // Largest Contentful Paint
  fid: decimal('fid', { precision: 10, scale: 2 }), // First Input Delay
  cls: decimal('cls', { precision: 10, scale: 4 }), // Cumulative Layout Shift
  ttfb: decimal('ttfb', { precision: 10, scale: 2 }), // Time to First Byte
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('performance_metrics_site_id_idx').on(table.siteId),
}));

// SSL Certificates
export const sslCertificates = pgTable('ssl_certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  issuer: text('issuer'),
  validFrom: timestamp('valid_from'),
  validTo: timestamp('valid_to'),
  daysUntilExpiry: integer('days_until_expiry'),
  isValid: boolean('is_valid').default(true),
  lastCheckedAt: timestamp('last_checked_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('ssl_certificates_site_id_idx').on(table.siteId),
}));

// Webhooks
export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // slack, discord, teams, generic
  url: text('url').notNull(),
  isActive: boolean('is_active').default(true),
  events: text('events').array(), // ['downtime', 'recovery', 'ssl_expiry', 'slow_response']
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('webhooks_user_id_idx').on(table.userId),
}));

// Incidents - Track outages with timeline
export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('ongoing'), // ongoing, resolved, investigating
  cause: text('cause'), // User-added root cause
  screenshotUrl: text('screenshot_url'), // Screenshot when incident started
  errorMessage: text('error_message'), // HTTP error or timeout message
  httpStatus: integer('http_status'), // HTTP status code when down
  startedAt: timestamp('started_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  duration: integer('duration'), // Total downtime in seconds
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: text('acknowledged_by'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('incidents_site_id_idx').on(table.siteId),
  userIdIdx: index('incidents_user_id_idx').on(table.userId),
  statusIdx: index('incidents_status_idx').on(table.status),
}));

// Maintenance Windows
export const maintenanceWindows = pgTable('maintenance_windows', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  siteIdIdx: index('maintenance_site_id_idx').on(table.siteId),
}));

// Status Page Subscribers
export const statusSubscribers = pgTable('status_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  isVerified: boolean('is_verified').default(false),
  verificationToken: text('verification_token'),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at'),
}, (table) => ({
  userIdIdx: index('status_subscribers_user_id_idx').on(table.userId),
  emailIdx: index('status_subscribers_email_idx').on(table.email),
}));

// Team Members - for team collaboration
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // Account owner
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // The team member (if registered)
  email: text('email').notNull(), // Email of invited member
  role: text('role').default('viewer'), // admin, editor, viewer
  status: text('status').default('pending'), // pending, active, revoked
  inviteToken: text('invite_token'),
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  permissions: text('permissions').array(), // ['view_sites', 'manage_sites', 'view_alerts', 'manage_alerts']
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  ownerIdIdx: index('team_members_owner_id_idx').on(table.ownerId),
  userIdIdx: index('team_members_user_id_idx').on(table.userId),
  emailIdx: index('team_members_email_idx').on(table.email),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sites: many(sites),
  alerts: many(alerts),
  webhooks: many(webhooks),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  user: one(users, {
    fields: [sites.userId],
    references: [users.id],
  }),
  uptimeChecks: many(uptimeChecks),
  visualSnapshots: many(visualSnapshots),
  alerts: many(alerts),
  performanceMetrics: many(performanceMetrics),
  sslCertificate: one(sslCertificates),
}));

export const uptimeChecksRelations = relations(uptimeChecks, ({ one }) => ({
  site: one(sites, {
    fields: [uptimeChecks.siteId],
    references: [sites.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  site: one(sites, {
    fields: [alerts.siteId],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  site: one(sites, {
    fields: [incidents.siteId],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [incidents.userId],
    references: [users.id],
  }),
}));

export const maintenanceWindowsRelations = relations(maintenanceWindows, ({ one }) => ({
  site: one(sites, {
    fields: [maintenanceWindows.siteId],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [maintenanceWindows.userId],
    references: [users.id],
  }),
}));

export const statusSubscribersRelations = relations(statusSubscribers, ({ one }) => ({
  user: one(users, {
    fields: [statusSubscribers.userId],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  owner: one(users, {
    fields: [teamMembers.ownerId],
    references: [users.id],
    relationName: 'teamOwner',
  }),
  member: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
    relationName: 'teamMember',
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type UptimeCheck = typeof uptimeChecks.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type SSLCertificate = typeof sslCertificates.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type MaintenanceWindow = typeof maintenanceWindows.$inferSelect;
export type StatusSubscriber = typeof statusSubscribers.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
