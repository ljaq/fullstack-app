import { Controller, Get } from '@midwayjs/core'
// import React from 'react';

@Controller('/api/app')
export class HomeController {
  @Get('*')
  async index(ctx) {
    // const context = {};
    ctx.body = '123'
  }
}
