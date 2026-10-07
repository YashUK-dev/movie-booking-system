import { TheatreService } from '../services/theatre.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, getPaginationResponse } from '../utils/pagination.js';

export class TheatreController {
  static createTheatre = asyncHandler(async (req, res) => {
    const theatre = await TheatreService.createTheatre(req.body);
    res.status(201).json(new ApiResponse(201, 'Theatre created successfully', theatre));
  });

  static getTheatres = asyncHandler(async (req, res) => {
    const paginationParams = getPagination(req.query);
    const { theatres, total } = await TheatreService.getTheatres(req.query, paginationParams);
    
    res.status(200).json(
      new ApiResponse(
        200, 
        'Theatres fetched successfully', 
        theatres, 
        getPaginationResponse(paginationParams.page, paginationParams.limit, total)
      )
    );
  });

  static getTheatreById = asyncHandler(async (req, res) => {
    const theatre = await TheatreService.getTheatreById(req.params.theatreId);
    res.status(200).json(new ApiResponse(200, 'Theatre fetched successfully', theatre));
  });

  static updateTheatre = asyncHandler(async (req, res) => {
    const theatre = await TheatreService.updateTheatre(req.params.theatreId, req.body);
    res.status(200).json(new ApiResponse(200, 'Theatre updated successfully', theatre));
  });

  static deleteTheatre = asyncHandler(async (req, res) => {
    await TheatreService.deleteTheatre(req.params.theatreId);
    res.status(204).send();
  });
}
