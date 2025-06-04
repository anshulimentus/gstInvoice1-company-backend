import { Controller, Get } from "@nestjs/common";
import { StateService } from "./state.service";

@Controller('state')
export class StateController {  
    constructor(private readonly stateService: StateService) {}

    @Get()
    async getStates() {
        return await this.stateService.getStates();
    }

    @Get(':id')
    async getState(id: number) {
        return await this.stateService.getState(id);
    }   
}