import axios, { AxiosInstance } from 'axios';
import { Dayjs } from 'dayjs';
import dayjs from '../../dayjs';
import { logger } from '../../logging.service';

export enum DailyMetric {
    // DAILY_METRIC_UNKNOWN = "DAILY_METRIC_UNKNOWN",
    BUSINESS_IMPRESSIONS_DESKTOP_MAPS = 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
    BUSINESS_IMPRESSIONS_DESKTOP_SEARCH = 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    BUSINESS_IMPRESSIONS_MOBILE_MAPS = 'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
    BUSINESS_IMPRESSIONS_MOBILE_SEARCH = 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    BUSINESS_CONVERSATIONS = 'BUSINESS_CONVERSATIONS',
    BUSINESS_DIRECTION_REQUESTS = 'BUSINESS_DIRECTION_REQUESTS',
    CALL_CLICKS = 'CALL_CLICKS',
    WEBSITE_CLICKS = 'WEBSITE_CLICKS',
    BUSINESS_BOOKINGS = 'BUSINESS_BOOKINGS',
    BUSINESS_FOOD_ORDERS = 'BUSINESS_FOOD_ORDERS',
    BUSINESS_FOOD_MENU_CLICKS = 'BUSINESS_FOOD_MENU_CLICKS',
}

type GetInsightsOptions = {
    locationId: string;
    start: Dayjs;
    end: Dayjs;
};

type MultiDailyMetricResponse = {
    multiDailyMetricTimeSeries: {
        dailyMetricTimeSeries: {
            dailyMetric: DailyMetric;
            timeSeries: {
                datedValues: {
                    date: {
                        year: number;
                        month: number;
                        day: number;
                    };
                    value: string;
                }[];
            };
        }[];
    }[];
};

export const getInsights = async (client: AxiosInstance, options: GetInsightsOptions) => {
    const { locationId, start, end } = options;

    return client
        .request<MultiDailyMetricResponse>({
            method: 'GET',
            url: `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries`,
            params: {
                dailyMetrics: Object.values(DailyMetric),
                'dailyRange.start_date.year': start.year(),
                'dailyRange.start_date.month': start.month() + 1,
                'dailyRange.start_date.day': start.date(),
                'dailyRange.end_date.year': end.year(),
                'dailyRange.end_date.month': end.month() + 1,
                'dailyRange.end_date.day': end.date(),
            },
            paramsSerializer: {
                indexes: null,
            },
        })
        .then((response) => response.data)
        .then((data) => {
            return data.multiDailyMetricTimeSeries.flatMap((multiDailyMetrics) => {
                return multiDailyMetrics.dailyMetricTimeSeries.flatMap((metric) => {
                    return metric.timeSeries.datedValues.map(({ date, value }) => ({
                        location_id: locationId,
                        metric: metric.dailyMetric,
                        date: dayjs()
                            .year(date.year)
                            .month(date.month - 1)
                            .date(date.day)
                            .format('YYYY-MM-DD'),
                        value,
                    }));
                });
            });
        })
        .then((rows) => rows.filter((row) => !!row.value))
        .catch((error) => {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                logger.warn({ fn: 'getInsights', locationId });
                return [];
            }

            throw error;
        });
};
