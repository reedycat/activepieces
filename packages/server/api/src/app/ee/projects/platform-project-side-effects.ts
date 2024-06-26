import dayjs from 'dayjs'
import { ProjectId } from '@activepieces/shared'
import { logger } from 'server-shared'
import { platformProjectService } from './platform-project-service'
import { systemJobsSchedule } from '../../helper/system-jobs'
import { SystemJobData } from '../../helper/system-jobs/common'

export const platformProjectSideEffects = {
    async onSoftDelete({ id }: OnSoftDeleteParams): Promise<void> {
        await systemJobsSchedule.upsertJob({
            job: {
                name: 'hard-delete-project',
                data: {
                    projectId: id,
                },
            },
            schedule: {
                type: 'one-time',
                date: dayjs().add(30, 'days'),
            },
            handler: hardDeleteProjectJobHandler,
        })
    },
}

const hardDeleteProjectJobHandler = async (job: SystemJobData<'hard-delete-project'>): Promise<void> => {
    logger.info({ name: 'PlatformProjectSideEffects#hardDeleteProjectJobHandler', projectId: job.projectId })
    await platformProjectService.hardDelete({ id: job.projectId })
}

type OnSoftDeleteParams = {
    id: ProjectId
}
