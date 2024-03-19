import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { buildAccountEntityKey, convertUser } from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext) {
  const client = createServicesClient(instance);
  const users = await client.getUsers();

  const accountEntity = await jobState.findEntity(
    buildAccountEntityKey(instance.id),
  );

  if (!accountEntity) {
    throw new IntegrationError({
      message: 'Could not find account entity in job state',
      code: 'MISSING_ENTITY',
      fatal: true,
    });
  }

  for (const user of users) {
    const userEntity = convertUser(user);
    await jobState.addEntity(userEntity);

    await jobState.addRelationship(
      createDirectRelationship({
        from: accountEntity,
        to: userEntity,
        _class: RelationshipClass.HAS,
      }),
    );
  }
}

const step: IntegrationStep = {
  id: Steps.USERS,
  name: 'Fetch Detectify Members',
  entities: [Entities.USER],
  relationships: [Relationships.ACCOUNT_HAS_USER],
  dependsOn: [Steps.ACCOUNT],
  executionHandler: fetchUsers,
};

export default step;
