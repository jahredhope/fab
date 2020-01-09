import { PluginMetadata, ProtoFab } from '@fab/core'
import { build } from '../src/build'
import { shouldThrow } from '@fab/core/test/helpers'

describe('@fab/input-static', () => {
  it('should require a dir argument', async () => {
    await shouldThrow(
      // @ts-ignore
      () => build({}, new ProtoFab()),
      `@fab/input-static requires an argument of 'dir'.`
    )
  })

  it('should check the dir exists', async () => {
    await shouldThrow(
      () =>
        build(
          {
            dir: './no-existo',
          },
          new ProtoFab()
        ),
      `@fab/input-static specifies a 'dir' of './no-existo', which doesn't exist.`
    )
  })

  it('should check the dir exists', async () => {
    const proto_fab = new ProtoFab<PluginMetadata>()
    proto_fab.files.set('/a', 'something')
    await shouldThrow(
      () =>
        build(
          {
            dir: __dirname + '/fixtures',
          },
          proto_fab
        ),
      `@fab/input-static must be the first 'input' plugin in the chain.`
    )
  })
})