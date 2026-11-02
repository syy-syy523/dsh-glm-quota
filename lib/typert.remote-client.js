/* Client-face Typert remote manifest for dsh-glm-quota.
 * Updated for dsh 0.2.x typert protocol: strict result codecs must expose a
 * lazy create() factory backed by a real zod schema. */

import { z } from "zod";

let _glmUsageSnapshotResultSchema$value;
const glmUsageSnapshotResultSchema = () =>
	(_glmUsageSnapshotResultSchema$value ??= z.object({
		limits: z.array(
			z.object({
				type: z.string().nullable(),
				unit: z.number().nullable(),
				label: z.string(),
				percent: z.number().nullable(),
				used: z.number().nullable(),
				cap: z.number().nullable(),
				resetTime: z.string().nullable(),
			})
		),
		peak: z.boolean(),
		level: z.string().nullable(),
	}));

export const TYPERT_REMOTE = {
  package: "dsh-glm-quota",
  descriptors: [
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
        create: glmUsageSnapshotResultSchema,
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

export default TYPERT_REMOTE;
