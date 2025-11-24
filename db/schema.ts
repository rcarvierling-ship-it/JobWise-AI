import { pgTable, text, timestamp, jsonb, varchar, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const subscriptionStatusEnum = pgEnum("subscription_status", ["trial", "active", "cancelled", "expired"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("trial").notNull(),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resumes = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rawText: text("raw_text"),
  parsedJson: jsonb("parsed_json"),
  finalText: text("final_text"),
  style: text("style"), // ats-optimized, modern, traditional, minimal, creative
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coverLetters = pgTable("cover_letters", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobDescription: text("job_description"),
  outputText: text("output_text"),
  tone: text("tone"), // formal, friendly, concise, confident
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobStatusEnum = pgEnum("job_status", ["saved", "applied", "interview", "offer", "rejected"]);

export const jobApplications = pgTable("job_applications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobUrl: text("job_url"),
  jobDescription: text("job_description"),
  status: jobStatusEnum("status").default("saved").notNull(),
  position: integer("position"), // for kanban ordering
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applicationAnswers = pgTable("application_answers", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => jobApplications.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  answerType: text("answer_type"), // short, long, star
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const autoApplyPacks = pgTable("auto_apply_packs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inputUrls: jsonb("input_urls").notNull(), // array of URLs
  generatedOutputs: jsonb("generated_outputs"), // JSON with all generated content
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  coverLetters: many(coverLetters),
  jobApplications: many(jobApplications),
  autoApplyPacks: many(autoApplyPacks),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
  answers: many(applicationAnswers),
}));

export const applicationAnswersRelations = relations(applicationAnswers, ({ one }) => ({
  application: one(jobApplications, {
    fields: [applicationAnswers.applicationId],
    references: [jobApplications.id],
  }),
}));

export const autoApplyPacksRelations = relations(autoApplyPacks, ({ one }) => ({
  user: one(users, {
    fields: [autoApplyPacks.userId],
    references: [users.id],
  }),
}));

