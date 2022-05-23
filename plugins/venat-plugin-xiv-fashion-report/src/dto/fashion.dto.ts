import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { FashionReportKind } from '../data/fashion-report';

const reportKindMap = new Map<string, FashionReportKind>([
  ['Theme', FashionReportKind.Theme],
  ['100 Points', FashionReportKind.MaxPoints],
  ['Full Details', FashionReportKind.FullDetails],
]);

export class FashionDto {
  @Choice(reportKindMap)
  @Param({
    description: 'The fashion report info to look up.',
    name: 'info',
    required: true,
    type: ParamType.INTEGER,
  })
  public info!: FashionReportKind;
}
