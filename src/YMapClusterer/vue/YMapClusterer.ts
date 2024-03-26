import type TVue from '@vue/runtime-core';
import type {LngLat} from '@yandex/ymaps3-types/common/types';
import type {CustomVuefyFn, CustomVuefyOptions} from '@yandex/ymaps3-types/modules/vuefy';
import type {ClustererObject, YMapClusterer, YMapClustererProps} from '..';
import {THROTTLE_DEFAULT_TIMEOUT_MS} from '../constants';
import type {Feature} from '../interface';

export const YMapClustererVuefyOptions: CustomVuefyOptions<YMapClusterer> = {
    props: {
        method: {type: Object, required: true},
        features: {type: Array, required: true},
        marker: Function as TVue.PropType<YMapClustererProps['marker']>,
        cluster: Function as TVue.PropType<YMapClustererProps['cluster']>,
        tickTimeout: {type: Number, default: THROTTLE_DEFAULT_TIMEOUT_MS},
        onRender: Function as TVue.PropType<YMapClustererProps['onRender']>,
        maxZoom: {type: Number}
    }
};

type EntitiesMap = {
    [x: string]: TVue.VNodeChild;
};

type YMapClustererSlots = {
    marker?: {feature: Feature};
    cluster?: {coordinates: LngLat; features: Feature[]};
};

export const YMapClustererVuefyOverride: CustomVuefyFn<YMapClusterer> = (YMapClustererI, props, {vuefy, Vue}) => {
    const YMapClustererV = vuefy.entity(YMapClustererI, props);
    const YMapCollectionV = vuefy.entity(ymaps3.YMapCollection, props);
    return Vue.defineComponent({
        name: 'YMapClustererContainer',
        props,
        slots: Object as TVue.SlotsType<YMapClustererSlots>,
        setup(props, {slots}) {
            const clustersVNode: TVue.Ref<TVue.VNodeChild[] | null> = Vue.ref(null);
            const onRender = (clusters: ClustererObject[]): false => {
                const vueClusters: EntitiesMap = {};
                clusters.forEach(({lnglat, features, clusterId}) => {
                    vueClusters[clusterId] = Vue.h(
                        Vue.Fragment,
                        {key: clusterId},
                        features.length === 1
                            ? slots.marker?.({feature: features[0]})
                            : slots.cluster?.({coordinates: lnglat, features})
                    );
                });
                clustersVNode.value = Object.values(vueClusters);
                return false;
            };
            return () => [
                Vue.h(YMapClustererV, {...props, onRender} as YMapClustererProps),
                Vue.h(YMapCollectionV, () => clustersVNode.value)
            ];
        }
    });
};
