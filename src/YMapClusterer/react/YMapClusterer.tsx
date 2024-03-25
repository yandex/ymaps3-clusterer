import type TReact from 'react';
import type {LngLat, YMapEntity} from '@yandex/ymaps3-types';
import type {CustomReactify, OverrideProps, Prettify} from '@yandex/ymaps3-types/reactify/reactify';

import type {ClustererObject, Feature} from '../interface';
import type {YMapClusterer as YMapClustererI, YMapClustererProps} from '../YMapClusterer';

/**
 * Create reactified version of YMapCluster module
 *
 * @example
 * ```jsx
 * <YMap location={LOCATION} ref={x => map = x}>
 *     <YMapDefaultSchemeLayer />
 *     <YMapFeatureDataSource id="my-source"/>
 *     <YMapLayer source="my-source" type="markers" zIndex={1800}/>
 *     <YMapClusterer
 *         marker={(feature) => <YMapMarker
 *             coordinates={feature.geometry.coordinates}
 *             source={'my-source'} >
 *                 <img src={'./pin.svg'}/>
 *             </YMapMarker>}
 *         cluster={(coordinates, features) => <YMapMarker
 *             coordinates={coordinates}
 *             source={'my-source'} >
 *             <div className="circle">
 *                 <div className="circle-content">
 *                     <span className="circle-text">{features.length}</span>
 *                 </div>
 *             </div>
 *             </YMapMarker>}
 *         method={gridSizedMethod}
 *         features={points}
 *     />
 * </YMap>
 * ```
 */

type YMapClustererReactifiedProps = Prettify<
    OverrideProps<
        YMapClustererProps,
        {
            /** Function that returns YMapMarker react component to render marker*/
            marker: (feature: Feature) => TReact.ReactElement;
            /** Function that returns YMapMarker react component to render cluster*/
            cluster: (coordinates: LngLat, features: Feature[]) => TReact.ReactElement;
        }
    >
>;

type YMapClustererImperative = new (props: YMapClustererReactifiedProps) => YMapEntity<YMapClustererReactifiedProps>;
type YMapClustererR = TReact.ForwardRefExoticComponent<
    YMapClustererReactifiedProps & React.RefAttributes<YMapEntity<YMapClustererReactifiedProps>>
>;

type EntitiesMap = {
    [x: string]: TReact.ReactElement;
};

export const YMapClustererReactifyOverride: CustomReactify<YMapClustererI, YMapClustererR> = (
    YMapClustererI,
    {reactify, React}
) => {
    const YMapClustererReactified = reactify.entity(YMapClustererI as unknown as YMapClustererImperative);

    const YMapClusterer = React.forwardRef<YMapEntity<YMapClustererReactifiedProps>, YMapClustererReactifiedProps>(
        (props, ref) => {
            const [clusters, setClusters] = React.useState<React.ReactNode[]>([]);

            const onRender = React.useCallback(
                (clusters: ClustererObject[]): false => {
                    const reactClusters: EntitiesMap = {};

                    clusters.forEach(({lnglat, features, clusterId}) => {
                        reactClusters[clusterId] = (
                            <React.Fragment key={clusterId}>
                                {/* @ts-ignore */}
                                {features.length === 1
                                    ? props.marker(features[0])
                                    : props.cluster(lnglat as LngLat, features)}
                            </React.Fragment>
                        );
                    });

                    setClusters(Object.values(reactClusters));
                    return false;
                },
                [props]
            );

            return (
                <>
                    <YMapClustererReactified {...props} ref={ref} onRender={onRender} />
                    {clusters}
                </>
            );
        }
    );

    return YMapClusterer;
};
