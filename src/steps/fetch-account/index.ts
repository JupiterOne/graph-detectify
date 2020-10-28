import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { getAccountEntity, getServiceEntity } from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.ACCOUNT,
  name: 'Fetch Detectify account and service',
  entities: [Entities.ACCOUNT, Entities.SERVICE],
  relationships: [Relationships.ACCOUNT_PROVIDES_SERVICE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const accountEntity = getAccountEntity(instance);
    await jobState.addEntity(accountEntity);

    const serviceEntity = getServiceEntity(instance);
    await jobState.addEntity(serviceEntity);

    const accountServiceRelationship = createDirectRelationship({
      from: accountEntity,
      to: serviceEntity,
      _class: RelationshipClass.PROVIDES,
    });
    await jobState.addRelationship(accountServiceRelationship);
  },
};

export default step;
