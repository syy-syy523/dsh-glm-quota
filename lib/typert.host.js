/**
 * Host-face Typert manifest for dsh-glm-quota.
 *
 * Result codecs must be backed by real zod v4 schemas — the typert-loader
 * rejects hand-rolled parse/safeParse stand-ins at registration time.
 */
import { z } from "zod";

const limitEntrySchema = z.object({
	type: z.string().nullable(),
	unit: z.number().nullable(),
	label: z.string(),
	percent: z.number().nullable(),
	resetTime: z.string().nullable(),
});

const glmUsageSnapshotResultSchema = z.object({
	limits: z.array(limitEntrySchema),
	peak: z.boolean(),
	level: z.string().nullable(),
});

export const TYPERT = {
	package: "dsh-glm-quota",
	face: "host",
	schemas: [],
	invocations: [
		{
			id: "dsh-glm-quota#glmQuota/snapshot",
			service: "glmQuota",
			namespace: "glmQuota",
			method: "snapshot",
			invocation: { kind: "direct" },
			parameters: [],
			result: {
				mode: "strict",
				typeSymbol: "dsh-glm-quota/types#GlmQuotaSnapshot",
				schema: glmUsageSnapshotResultSchema,
			},
			sourceLocation: { file: "lib/index.js", line: 1, column: 1 },
		},
	],
	model: {
		services: [],
		events: [],
		objects: [],
	},
};

export default TYPERT;
