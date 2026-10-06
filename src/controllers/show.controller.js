import { ShowService } from '../services/show.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, getPaginationResponse } from '../utils/pagination.js';

export class ShowController {
  static createShow = asyncHandler(async (req, res) => {
    const show = await ShowService.createShow(req.body);
    res.status(201).json(new ApiResponse(201, 'Show created successfully', show));
  });

  static getShows = asyncHandler(async (req, res) => {
    const paginationParams = getPagination(req.query);
    const { shows, total } = await ShowService.getShows(req.query, paginationParams);
    
    res.status(200).json(
      new ApiResponse(
        200, 
        'Shows fetched successfully', 
        shows, 
        getPaginationResponse(paginationParams.page, paginationParams.limit, total)
      )
    );
  });

  static getShowDetails = asyncHandler(async (req, res) => {
    const details = await ShowService.getShowDetails(req.params.showId);
    res.status(200).json(new ApiResponse(200, 'Show details fetched successfully', details));
  });

  static getShowSeats = asyncHandler(async (req, res) => {
    const seats = await ShowService.getShowSeats(req.params.showId);
    res.status(200).json(new ApiResponse(200, 'Seat availability fetched successfully', seats));
  });

  static updateShow = asyncHandler(async (req, res) => {
    const show = await ShowService.updateShow(req.params.showId, req.body);
    res.status(200).json(new ApiResponse(200, 'Show updated successfully', show));
  });

  static lockSeats = asyncHandler(async (req, res) => {
    const { seatIds } = req.body;
    const result = await ShowService.lockSeats(req.params.showId, seatIds, req.user.userId);
    res.status(200).json(new ApiResponse(200, 'Seats locked successfully', result));
  });
}
