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
  plan: text('plan').default('free'), // free, starter, pro, agency
  alertEmail: text('alert_email'),
  alertPhone: text('alert_phone'),
  emailVerified: boolean('email_verified').default(false),
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
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('sites_user_id_idx').on(table.userId),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sites: many(sites),
  alerts: many(alerts),
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

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type UptimeCheck = typeof uptimeChecks.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type SSLCertificate = typeof sslCertificates.$inferSelect;
