#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <Vision/Vision.h>

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 2) {
            fprintf(stderr, "Usage: ocr-dse-page IMAGE\n");
            return 2;
        }
        NSString *path = [NSString stringWithUTF8String:argv[1]];
        NSImage *image = [[NSImage alloc] initWithContentsOfFile:path];
        CGImageRef cgImage = [image CGImageForProposedRect:NULL context:nil hints:nil];
        if (!cgImage) {
            fprintf(stderr, "Unable to read image\n");
            return 1;
        }

        VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] init];
        request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
        request.usesLanguageCorrection = YES;
        request.recognitionLanguages = @[@"en-GB", @"en-US"];
        request.minimumTextHeight = 0.006;
        VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCGImage:cgImage options:@{}];
        NSError *error = nil;
        if (![handler performRequests:@[request] error:&error]) {
            fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
            return 1;
        }

        CGFloat width = CGImageGetWidth(cgImage);
        CGFloat height = CGImageGetHeight(cgImage);
        NSMutableArray *lines = [NSMutableArray array];
        for (VNRecognizedTextObservation *observation in request.results) {
            VNRecognizedText *candidate = [observation topCandidates:1].firstObject;
            if (!candidate) continue;
            CGRect box = observation.boundingBox;
            [lines addObject:@{
                @"x": @(lround(CGRectGetMinX(box) * width)),
                @"y": @(lround((1.0 - CGRectGetMaxY(box)) * height)),
                @"width": @(lround(CGRectGetWidth(box) * width)),
                @"height": @(lround(CGRectGetHeight(box) * height)),
                @"text": candidate.string,
            }];
        }
        [lines sortUsingComparator:^NSComparisonResult(NSDictionary *left, NSDictionary *right) {
            NSInteger leftY = [left[@"y"] integerValue];
            NSInteger rightY = [right[@"y"] integerValue];
            if (labs(leftY - rightY) > 8) return leftY < rightY ? NSOrderedAscending : NSOrderedDescending;
            return [left[@"x"] integerValue] < [right[@"x"] integerValue] ? NSOrderedAscending : NSOrderedDescending;
        }];
        NSData *output = [NSJSONSerialization dataWithJSONObject:lines options:NSJSONWritingPrettyPrinted error:&error];
        if (!output) {
            fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
            return 1;
        }
        fwrite(output.bytes, 1, output.length, stdout);
        fputc('\n', stdout);
    }
    return 0;
}
